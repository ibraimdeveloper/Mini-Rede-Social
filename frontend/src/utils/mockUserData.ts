export interface IUserProfile {
    username: string;
    photoUrl: string;
    name: string;
    surname: string;
    email: string;
    description: string;
}

export interface IFriend {
    id: number;
    name: string;
    username: string;
    bio: string;
    photoUrl: string;
    isOnline: boolean;
    lastMessage: string;
}

const PROFILE_KEY = "appUserProfile";
const FRIENDS_KEY = "appFriends";

export const DEFAULT_USER_PROFILE: IUserProfile = {
    username: "danielvemba",
    photoUrl: "",
    name: "Daniel",
    surname: "Vemba",
    email: "daniel@email.com",
    description: "Disponível"
};

const DEFAULT_FRIENDS: IFriend[] = [
    {
        id: 2,
        name: "Lorde Catambi",
        username: "Lorde Catambi",
        bio: "Jogador competitivo e sempre online no chat.",
        photoUrl: "https://i.pravatar.cc/80?img=18",
        isOnline: true,
        lastMessage: "Wy, makie?"
    }
];

const USER_CANDIDATES: IFriend[] = [
    {
        id: 3,
        name: "Maria Silva",
        username: "Maria Silva",
        bio: "Dev front-end, focada em UI e animações.",
        photoUrl: "https://i.pravatar.cc/80?img=32",
        isOnline: false,
        lastMessage: "Trabalhando no projeto"
    },
    {
        id: 4,
        name: "João Pedro",
        username: "João Pedro",
        bio: "Curte jogos retro e desafios de lógica.",
        photoUrl: "https://i.pravatar.cc/80?img=51",
        isOnline: true,
        lastMessage: "Bora jogar?"
    },
    {
        id: 5,
        name: "Ana Rocha",
        username: "Ana Rocha",
        bio: "Sempre responde depois, mas responde 😄",
        photoUrl: "https://i.pravatar.cc/80?img=47",
        isOnline: false,
        lastMessage: "Falamos depois"
    },
    {
        id: 6,
        name: "Carlos Neto",
        username: "Carlos Neto",
        bio: "Online agora e pronto para conversar.",
        photoUrl: "https://i.pravatar.cc/80?img=57",
        isOnline: true,
        lastMessage: "Online agora"
    }
];

export function getUserProfile() {
    const storedProfile = localStorage.getItem(PROFILE_KEY);

    if (!storedProfile) {
        return DEFAULT_USER_PROFILE;
    }

    try {
        const parsedProfile = JSON.parse(storedProfile) as Partial<IUserProfile>;
        return {
            ...DEFAULT_USER_PROFILE,
            ...parsedProfile
        };
    } catch {
        return DEFAULT_USER_PROFILE;
    }
}

export function saveUserProfile(profile: IUserProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getFriends() {
    const storedFriends = localStorage.getItem(FRIENDS_KEY);

    if (!storedFriends) {
        return DEFAULT_FRIENDS;
    }

    try {
        return JSON.parse(storedFriends) as IFriend[];
    } catch {
        return DEFAULT_FRIENDS;
    }
}

export function saveFriends(friends: IFriend[]) {
    localStorage.setItem(FRIENDS_KEY, JSON.stringify(friends));
}

export function getFriendById(friendId: number) {
    return getFriends().find((friend) => friend.id === friendId) ?? null;
}

export function getUserById(friendId: number) {
    const friends = getFriends();
    const friend = friends.find((item) => item.id === friendId);

    if (friend) {
        return friend;
    }

    return USER_CANDIDATES.find((item) => item.id === friendId) ?? null;
}

export function isFriend(friendId: number) {
    return getFriends().some((friend) => friend.id === friendId);
}

export function addFriendById(friendId: number) {
    const friends = getFriends();

    if (friends.some((friend) => friend.id === friendId)) {
        return friends;
    }

    const candidate = USER_CANDIDATES.find((user) => user.id === friendId);

    if (!candidate) {
        return friends;
    }

    const nextFriends = [...friends, candidate];
    saveFriends(nextFriends);
    return nextFriends;
}

export function removeFriendById(friendId: number) {
    const nextFriends = getFriends().filter((friend) => friend.id !== friendId);
    saveFriends(nextFriends);
    return nextFriends;
}

export function getAllUsers() {
    const friends = getFriends();
    const usersMap = new Map<number, IFriend>();

    for (const friend of friends) {
        usersMap.set(friend.id, friend);
    }

    for (const candidate of USER_CANDIDATES) {
        if (!usersMap.has(candidate.id)) {
            usersMap.set(candidate.id, candidate);
        }
    }

    return Array.from(usersMap.values());
}

export function searchUsers(searchValue: string, friendIds: number[]) {
    const search = searchValue.trim().toLowerCase();

    if (!search) {
        return [] as IFriend[];
    }

    return USER_CANDIDATES.filter((candidate) => {
        return candidate.username.toLowerCase().includes(search) && !friendIds.includes(candidate.id);
    });
}
