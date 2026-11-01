package com.watersupply.tracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point. @SpringBootApplication turns on auto-configuration and
 * scans this package (and sub-packages) for controllers, services, etc.
 */
@SpringBootApplication
public class WaterSupplyTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(WaterSupplyTrackerApplication.class, args);
    }
}
