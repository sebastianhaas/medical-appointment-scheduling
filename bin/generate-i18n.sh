# 1) Have to comment out all styleUrl declarations
for i in src/app/*.component.ts; do
    sed -i '' 's/\(styleUrls:.*\)/\/\/ \1/g' "$i";
done
for i in src/app/appointment/*.component.ts; do
    sed -i '' 's/\(styleUrls:.*\)/\/\/ \1/g' "$i";
done

# 2) Run ng-x18n
npm run i18n

# 3) Clean tsc js output
rm -rf ./tmp

# 4) Remove comments from all styleUrl declarations (undo 1) )
for i in src/app/*.component.ts; do
    sed -i '' 's/\(\/\/ \)\(styleUrls:.*\)/\2/g' "$i";
done
for i in src/app/appointment/*.component.ts; do
    sed -i '' 's/\(\/\/ \)\(styleUrls:.*\)/\2/g' "$i";
done
