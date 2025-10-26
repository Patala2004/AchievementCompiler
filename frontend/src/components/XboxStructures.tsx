export interface XboxUser {
    id: string,
    settingsObject : {
        Gamertag: string,
        GameDisplayPicRaw: string,
    }
}

export interface XboxGame {
    name: string,
    titleId: string,
    displayImage: string,
    achievement: {
        currentAchievements: number,
        totalAchievements: number
    },
    devices: string[];
}