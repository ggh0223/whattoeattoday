export type SocialPostSource = 'instagram' | 'kakao';
export declare class Menu {
    id: number;
    title: string;
    content: string;
    imageUrls: string[];
    source: SocialPostSource;
    createdAt: Date;
}
