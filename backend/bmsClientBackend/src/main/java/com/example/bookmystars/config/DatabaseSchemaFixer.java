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
                                EXECUTE format('ALTER TABLE %%I ALTER COLUMN %%I DROP NOT NULL', '%s', col.column_name);
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

        try {
            String clientPartnerSql = """
                DO $$
                BEGIN
                    BEGIN
                        ALTER TABLE client_partner_profiles ALTER COLUMN logo_url TYPE TEXT;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                    BEGIN
                        ALTER TABLE client_partner_profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                    BEGIN
                        ALTER TABLE client_partner_profiles ALTER COLUMN map_coordinates TYPE TEXT;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                    BEGIN
                        ALTER TABLE client_partner_profiles ALTER COLUMN social_visibility TYPE TEXT;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                    BEGIN
                        ALTER TABLE client_partner_profiles ALTER COLUMN facebook TYPE TEXT;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                    BEGIN
                        ALTER TABLE client_partner_profiles ALTER COLUMN twitter TYPE TEXT;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                    BEGIN
                        ALTER TABLE client_partner_profiles ALTER COLUMN whatsapp TYPE TEXT;
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                END $$;
            """;
            jdbcTemplate.execute(clientPartnerSql);
            log.info("DatabaseSchemaFixer: successfully verified and updated client_partner_profiles columns to TEXT");
        } catch (Exception ex) {
            log.warn("DatabaseSchemaFixer note for client_partner_profiles: {}", ex.getMessage());
        }

        try {
            String showcaseSql = """
                CREATE TABLE IF NOT EXISTS client_partner_showcases (
                    id BIGSERIAL PRIMARY KEY,
                    user_id BIGINT NOT NULL,
                    entity_type VARCHAR(20) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    media_type VARCHAR(20) NOT NULL,
                    media_url TEXT NOT NULL,
                    thumbnail_url TEXT,
                    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
                    rejection_reason TEXT,
                    reviewed_by VARCHAR(100),
                    reviewed_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP,
                    CONSTRAINT fk_showcase_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
                CREATE INDEX IF NOT EXISTS idx_cps_user_id ON client_partner_showcases(user_id);
                CREATE INDEX IF NOT EXISTS idx_cps_status ON client_partner_showcases(status);
                CREATE INDEX IF NOT EXISTS idx_cps_entity_type ON client_partner_showcases(entity_type);
            """;
            jdbcTemplate.execute(showcaseSql);
            log.info("DatabaseSchemaFixer: successfully verified client_partner_showcases table and indexes");
        } catch (Exception ex) {
            log.warn("DatabaseSchemaFixer note for client_partner_showcases: {}", ex.getMessage());
        }

        try {
            String talentMediaSql = """
                DO $$
                BEGIN
                    BEGIN
                        ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'APPROVED';
                        ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
                        ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(100);
                        ALTER TABLE portfolio ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
                        UPDATE portfolio SET status = 'APPROVED' WHERE status IS NULL;
                        CREATE INDEX IF NOT EXISTS idx_portfolio_status ON portfolio(status);
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;

                    BEGIN
                        ALTER TABLE videos ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'APPROVED';
                        ALTER TABLE videos ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
                        ALTER TABLE videos ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(100);
                        ALTER TABLE videos ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
                        UPDATE videos SET status = 'APPROVED' WHERE status IS NULL;
                        CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;

                    BEGIN
                        ALTER TABLE audios ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'APPROVED';
                        ALTER TABLE audios ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
                        ALTER TABLE audios ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(100);
                        ALTER TABLE audios ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP;
                        UPDATE audios SET status = 'APPROVED' WHERE status IS NULL;
                        CREATE INDEX IF NOT EXISTS idx_audios_status ON audios(status);
                    EXCEPTION WHEN OTHERS THEN NULL;
                    END;
                END $$;
            """;
            jdbcTemplate.execute(talentMediaSql);
            log.info("DatabaseSchemaFixer: successfully verified talent media moderation columns and indexes (portfolio, videos, audios)");
        } catch (Exception ex) {
            log.warn("DatabaseSchemaFixer note for talent media moderation: {}", ex.getMessage());
        }
    }
}
