- Run this from root folder to open each app:

npx expo start --clear -c apps/pickleball-editor
npx expo start --clear -c apps/tennis-editor

- Add dependency to repos:

yarn workspace pickleball-editor add [DEPENDENCY]
yarn workspace tennis-editor add [DEPENDENCY]

- Create new dev build:

cd apps/pickleball-editor
npx eas build --profile development --platform ios# ai-editor-upwork
