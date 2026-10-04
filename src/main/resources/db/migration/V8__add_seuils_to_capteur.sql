-- Add threshold columns to capteur table for IoT alert functionality
ALTER TABLE capteur ADD COLUMN seuil_temperature_max DOUBLE PRECISION;
ALTER TABLE capteur ADD COLUMN seuil_humidite_max DOUBLE PRECISION;
