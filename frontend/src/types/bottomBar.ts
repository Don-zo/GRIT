export interface EmojiModalProps {
    open: boolean;
    onSelect?: (emoji: string) => void;
    onClose?: () => void;
}