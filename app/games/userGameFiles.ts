/*
 * ================================================================
 * userGameFiles.ts
 * ================================================================
 *
 * برای هر کاربر (بر اساس نام/ایمیلی که با آن وارد اپ شده) یک فایل
 * JSON جداگانه روی حافظه‌ی دستگاه ساخته می‌شود. هر بار که کاربر
 * یک بازی را تمام می‌کند، یک رکورد جدید به فایل همان کاربر اضافه
 * می‌شود.
 *
 * این فایل‌ها داخل پوشه‌ی زیر ذخیره می‌شوند:
 *
 *   FileSystem.documentDirectory/norulia-game-results/<username>.json
 *
 * چون فعلاً سروری در کار نیست، این فایل‌ها فقط روی همان دستگاه
 * (شبیه‌ساز/گوشی) قابل مشاهده‌اند. از صفحه‌ی مدیریت نتایج
 * (app/games/admin-results.tsx) می‌توانید لیست کاربرها، محتوای هر
 * فایل و دکمه‌ی «اشتراک‌گذاری» را ببینید تا فایل JSON را از طریق
 * ایمیل/تلگرام/... برای خودتان بفرستید.
 *
 * توجه: برای کار کردن این فایل باید دو پکیج زیر نصب باشند:
 *
 *   npx expo install expo-file-system expo-sharing
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

/* ================================================================
   TYPES
================================================================ */

export type UserGameRecord = {
  /* شناسه‌ی بازی، مثلاً 'visual-flow' */
  gameId: string;

  /* نام قابل نمایش بازی، مثلاً 'جریان بصری' */
  gameName: string;

  /* هدف/مهارتی که این بازی می‌سنجد، مثلاً 'قدرت بینایی' */
  goal: string;

  /* امتیاز نهایی این نوبت بازی */
  score: number;

  /* شاخص‌های ریزتر عملکرد (اختیاری) */
  metrics?: {
    id: string;
    label: string;
    value: number;
    unit?: string;
  }[];

  /* زمان ثبت این نتیجه */
  timestamp: number;
};

export type UserGameFile = {
  /* نام/شناسه‌ی کاربر، همانی که با آن وارد اپ شده */
  username: string;

  /* همه‌ی نتایج بازی‌های این کاربر، جدیدترین در انتها */
  results: UserGameRecord[];

  updatedAt: number;
};

/* ================================================================
   PATHS
================================================================ */

const RESULTS_DIR = `${FileSystem.documentDirectory}norulia-game-results/`;

const sanitizeUsername = (username: string): string => {
  const trimmed = String(username || 'anonymous').trim();

  return (
    trimmed.replace(/[^a-zA-Z0-9_.@-]/g, '_') || 'anonymous'
  );
};

const getUserFileUri = (username: string): string => {
  const safeUsername = sanitizeUsername(username);

  return `${RESULTS_DIR}${safeUsername}.json`;
};

const ensureResultsDir = async (): Promise<void> => {
  try {
    const dirInfo = await FileSystem.getInfoAsync(RESULTS_DIR);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(RESULTS_DIR, {
        intermediates: true,
      });
    }
  } catch (error) {
    console.warn(
      '[UserGameFiles] Failed to ensure results directory:',
      error
    );
  }
};

/* ================================================================
   READ ONE USER FILE
================================================================ */

export async function getUserGameFile(
  username: string
): Promise<UserGameFile> {
  const safeUsername = sanitizeUsername(username);

  try {
    const fileUri = getUserFileUri(username);

    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (!fileInfo.exists) {
      return {
        username: safeUsername,
        results: [],
        updatedAt: Date.now(),
      };
    }

    const content = await FileSystem.readAsStringAsync(fileUri);

    const parsed = JSON.parse(content);

    if (
      parsed &&
      typeof parsed === 'object' &&
      Array.isArray(parsed.results)
    ) {
      return parsed as UserGameFile;
    }

    return {
      username: safeUsername,
      results: [],
      updatedAt: Date.now(),
    };
  } catch (error) {
    console.warn(
      '[UserGameFiles] Failed to read user file:',
      error
    );

    return {
      username: safeUsername,
      results: [],
      updatedAt: Date.now(),
    };
  }
}

/* ================================================================
   APPEND A NEW RESULT
================================================================ */

export async function appendUserGameResult(
  username: string,
  record: UserGameRecord
): Promise<UserGameFile> {
  await ensureResultsDir();

  const safeUsername = sanitizeUsername(username);

  const current = await getUserGameFile(username);

  const nextFile: UserGameFile = {
    username: safeUsername,
    results: [...current.results, record],
    updatedAt: Date.now(),
  };

  try {
    await FileSystem.writeAsStringAsync(
      getUserFileUri(username),
      JSON.stringify(nextFile, null, 2)
    );
  } catch (error) {
    console.warn(
      '[UserGameFiles] Failed to write user file:',
      error
    );
  }

  return nextFile;
}

/* ================================================================
   LIST ALL USERS THAT HAVE A FILE
================================================================ */

export async function listUserGameFiles(): Promise<string[]> {
  await ensureResultsDir();

  try {
    const entries = await FileSystem.readDirectoryAsync(
      RESULTS_DIR
    );

    return entries
      .filter((name) => name.endsWith('.json'))
      .map((name) => name.replace(/\.json$/, ''))
      .sort();
  } catch (error) {
    console.warn(
      '[UserGameFiles] Failed to list user files:',
      error
    );

    return [];
  }
}

/* ================================================================
   SHARE / EXPORT ONE USER FILE
================================================================ */

export async function shareUserGameFile(
  username: string
): Promise<void> {
  const fileUri = getUserFileUri(username);

  const fileInfo = await FileSystem.getInfoAsync(fileUri);

  if (!fileInfo.exists) {
    throw new Error(`No result file found for "${username}"`);
  }

  const isAvailable = await Sharing.isAvailableAsync();

  if (!isAvailable) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: `Norulia results - ${username}`,
  });
}

/* ================================================================
   DELETE ONE USER FILE
================================================================ */

export async function deleteUserGameFile(
  username: string
): Promise<void> {
  try {
    const fileUri = getUserFileUri(username);

    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri);
    }
  } catch (error) {
    console.warn(
      '[UserGameFiles] Failed to delete user file:',
      error
    );
  }
}
