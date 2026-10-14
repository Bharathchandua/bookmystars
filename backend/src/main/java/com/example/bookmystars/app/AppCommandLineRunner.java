package com.example.bookmystars.app;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AppCommandLineRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AppCommandLineRunner.class);

    @Override
    public void run(String... args) throws Exception {
        logger.info("=================================================");
        logger.info("   BookMyStars Application Started Successfully!  ");
        logger.info("   API Base URL:  http://localhost:8080/api      ");
        logger.info("   Swagger UI:    http://localhost:8080/swagger-ui.html ");
        logger.info("=================================================");
    }
}
