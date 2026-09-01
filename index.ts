// index.ts
import { I18nManager } from 'react-native';

console.log('BEFORE:', I18nManager.isRTL);
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);
console.log('AFTER forceRTL call:', I18nManager.isRTL);

require('expo-router/entry');