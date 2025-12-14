
export const ATTACHMENT_TYPE_LABELS: Record<string, string> = {
    'invoice': 'Fatura',
    'receipt': 'Fiş',
    'payment_receipt': 'Ödeme Dekontu',
    'warranty': 'Garanti Belgesi',
    'contract': 'Sözleşme',
    'certificate': 'Sertifika',
    'insurance': 'Sigorta Poliçesi',
    'license': 'Lisans/Ruhsat',
    'identity': 'Kimlik/Ehliyet',
    'other': 'Diğer',
};

export const getAttachmentTypeLabel = (name: string): string => {
    // If exact match found in map, use it
    if (ATTACHMENT_TYPE_LABELS[name]) {
        return ATTACHMENT_TYPE_LABELS[name];
    }

    // Fallback: If no match, clean up the format (replace _ with space, capitalize)
    return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
