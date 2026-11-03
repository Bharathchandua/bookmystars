package com.example.bookmystars.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaFixer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaFixer.class);
    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("Starting DatabaseSchemaFixer: verifying and relaxing legacy table constraints in PostgreSQL...");
        
        String[] tables = {"work_experience", "videos", "audios", "portfolio_items", "talent_profile"};
        for (String tableName : tables) {
            try {
                String sql = String.format("""
                    DO $$
                    DECLARE
                        col record;
                    BEGIN
                        FOR col IN 
                            SELECT column_name 
                            FROM information_schema.columns 
                            WHERE table_schema = 'public' 
                              AND table_name = '%s' 
                              AND is_nullable = 'NO'
                              AND column_name NOT IN ('id', 'user_id')
                        LOOP
                            BEGIN
                                EXECUTE format('ALTER TABLE %I ALTER COLUMN %I DROP NOT NULL', '%s', col.column_name);
                            EXCEPTION WHEN OTHERS THEN
                                -- Ignore constraints that cannot be altered
                            END;
                        END LOOP;
                    END $$;
                """, tableName, tableName);

                jdbcTemplate.execute(sql);
                log.info("DatabaseSchemaFixer: checked and relaxed constraints on table '{}'", tableName);
            } catch (Exception ex) {
                log.warn("DatabaseSchemaFixer note for table '{}': {}", tableName, ex.getMessage());
            }
        }
    }
}
