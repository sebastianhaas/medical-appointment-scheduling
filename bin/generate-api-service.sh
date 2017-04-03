java -jar ../swagger-codegen/modules/swagger-codegen-cli/target/swagger-codegen-cli.jar generate -i http://localhost:3000/explorer/swagger.json -l typescript-angular2 -o src/app/api

# Remove double imports from services
for i in src/app/api/api/*; do
    sed -i '' 's/^import { Models.*$//' "$i";
done
