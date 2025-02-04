#!/bin/bash

# Variables de conexión
DB_NAME="dbhci"
USER="postgres"
OUTPUT_DIR="/home/exports"  # Directorio donde guardarás los archivos CSV

# Obtener la lista de tablas
TABLES=$(psql -U $USER -d $DB_NAME -t -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';")

# Recorrer las tablas y exportarlas
for TABLE in $TABLES
do
    echo "Exportando tabla $TABLE..."
    psql -U $USER -d $DB_NAME -c "\COPY $TABLE TO '$OUTPUT_DIR/$TABLE.csv' WITH CSV HEADER"
done

echo "Exportación completada."

