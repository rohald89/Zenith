-- CreateTable
CREATE TABLE "World" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "canvas" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "World_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserPreferences" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "preferredThemeId" TEXT,
    "focusSessionDuration" INTEGER NOT NULL DEFAULT 1500,
    "musicProvider" TEXT NOT NULL DEFAULT 'SPOTIFY',
    "spotifyPlaylistUrl" TEXT NOT NULL DEFAULT '0vvXsWCC9xrXsKd4FyS8kM',
    "youtubePlaylistUrl" TEXT NOT NULL DEFAULT 'jfKfPfyJRdk',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserPreferences_preferredThemeId_fkey" FOREIGN KEY ("preferredThemeId") REFERENCES "Theme" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_UserPreferences" ("createdAt", "focusSessionDuration", "id", "musicProvider", "preferredThemeId", "spotifyPlaylistUrl", "updatedAt", "userId", "youtubePlaylistUrl") SELECT "createdAt", "focusSessionDuration", "id", "musicProvider", "preferredThemeId", coalesce("spotifyPlaylistUrl", '0vvXsWCC9xrXsKd4FyS8kM') AS "spotifyPlaylistUrl", "updatedAt", "userId", coalesce("youtubePlaylistUrl", 'jfKfPfyJRdk') AS "youtubePlaylistUrl" FROM "UserPreferences";
DROP TABLE "UserPreferences";
ALTER TABLE "new_UserPreferences" RENAME TO "UserPreferences";
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");
CREATE INDEX "UserPreferences_preferredThemeId_idx" ON "UserPreferences"("preferredThemeId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "World_userId_idx" ON "World"("userId");
