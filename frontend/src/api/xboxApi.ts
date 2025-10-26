import { XboxGame, XboxUser } from "../components/XboxStructures";

export async function getXboxProfile(xboxId: string): Promise<XboxUser> {
    const response = await fetch(`http://localhost:5000/api/xbox/getProfile?xboxId=${xboxId}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();

    // Convert settings array to an object
    const settingsObject = data.profileUsers[0].settings.reduce((acc: any, setting: any) => {
        acc[setting.id] = setting.value;
        return acc;
    }, {});

    data.profileUsers[0].settingsObject = settingsObject

    return data.profileUsers[0];
}

export async function getXboxGames(xboxId: string): Promise<XboxGame[]> {
    const response = await fetch(`http://localhost:5000/api/xbox/getGames?xboxId=${xboxId}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch (${response.status})`);
    }

    const data = await response.json();

    const filteredData = data.titles.filter((obj: { devices: string[]; }) =>
        obj.devices.some(device => device.toLowerCase().includes("xbox"))
    );

    return filteredData;
}