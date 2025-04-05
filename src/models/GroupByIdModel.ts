export interface GroupByIdModel {
    id: number;
    name: string;
    owner: string;
    items: ItemModel[];
    members: string[];
}

export interface ItemModel {
    id: number;
    name: string;
    price: number;
    hasPaid: boolean;
    payer: string | null;
}

export interface MemberModel {
    user: string;
}