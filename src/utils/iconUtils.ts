
// Map SF Symbols to emojis
export const sfSymbolToEmoji: Record<string, string> = {
    'person.fill': '👤',
    'briefcase': '💼',
    'briefcase.fill': '💼',
    'house': '🏠',
    'house.fill': '🏠',
    'car': '🚗',
    'car.fill': '🚗',
    'heart': '❤️',
    'heart.fill': '❤️',
    'star': '⭐',
    'star.fill': '⭐',
    'folder': '📁',
    'folder.fill': '📁',
    'doc': '📄',
    'doc.fill': '📄',
    'creditcard': '💳',
    'creditcard.fill': '💳',
    'bag': '🛍️',
    'bag.fill': '🛍️',
    'cart': '🛒',
    'cart.fill': '🛒',
    'gift': '🎁',
    'gift.fill': '🎁',
    'airplane': '✈️',
    'building': '🏢',
    'building.2': '🏢',
};

export const getIconDisplay = (icon?: string): string => {
    if (!icon) return '📁';

    // Check if it's an emoji (basic check for common emoji ranges)
    if (/^[\u{1F300}-\u{1F9FF}]|^[\u{2600}-\u{26FF}]|^[\u{2700}-\u{27BF}]/u.test(icon)) {
        return icon;
    }

    return sfSymbolToEmoji[icon] || '📁';
};
