// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Extended mapping type to support both SF Symbols and lucide icon names
type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'plus.circle.fill': 'add-circle',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'magnifyingglass': 'search',
  'slider.horizontal.3': 'tune',
  'folder.fill': 'folder',
  'text.justify.left': 'description',
  'lock.fill': 'lock',
  'ellipsis': 'more-horiz',
  'folder.badge.plus': 'create-new-folder',
  'gear': 'settings',
  'paperclip': 'attach-file',
  'viewfinder': 'center-focus-strong',
  'doc.fill': 'description',
  'doc.text.fill': 'article',
  'doc.plaintext.fill': 'notes',
  'receipt': 'receipt',
  'shield.fill': 'shield',
  'heart.text.square.fill': 'favorite',
  'calendar': 'calendar-today',
  'doc.text': 'description',
  'clock': 'access-time',
  'xmark.circle.fill': 'cancel',
  'xmark': 'close',
  'person.fill': 'person',
  'person.circle.fill': 'account-circle',
  'bell.fill': 'notifications',
  'globe': 'language',
  'moon.fill': 'dark-mode',
  'icloud': 'cloud',
  'arrow.down.circle.fill': 'download',
  'questionmark.circle.fill': 'help',
  'envelope.fill': 'email',
  'star.fill': 'star',
  'rectangle.portrait.and.arrow.right': 'logout',
  'trash.fill': 'delete',
  'pencil': 'edit',
  'qrcode.viewfinder': 'qr-code-scanner',
  'desktopcomputer': 'computer',
  'laptopcomputer': 'laptop',
  'iphone': 'smartphone',
  'camera.fill': 'camera-alt',
  'trash': 'delete',
  'chevron.left': 'chevron-left',
  // Additional folder icons
  'briefcase.fill': 'work',
  'briefcase': 'work',
  'tag.fill': 'local-offer',
  'tag': 'local-offer',
  'tray.fill': 'inbox',
  'tray': 'inbox',
  'heart.fill': 'favorite',
  'graduationcap.fill': 'school',
  'graduationcap': 'school',
  'person.text.rectangle.fill': 'badge',
  'person.text.rectangle': 'badge',
  'circle': 'radio-button-unchecked',
  'checkmark.circle.fill': 'check-circle',
  'checkmark.seal.fill': 'verified',
  'checkmark': 'check',
  'plus': 'add',
  'sparkles': 'auto-awesome',
  'doc.badge.plus': 'note-add',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',
  'folder.fill.badge.person.crop': 'folder-shared',
  // Lucide icon names from backend templates
  'folder-user': 'folder-shared',
  'id-card': 'badge',
  'file-text': 'description',
  'graduation-cap': 'school',
  'heart-pulse': 'favorite',
} as IconMapping;

export type IconSymbolName = keyof typeof MAPPING | string;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 * Falls back to 'folder' icon if mapping not found.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedIcon = MAPPING[name as keyof typeof MAPPING] || 'folder';
  return <MaterialIcons color={color} size={size} name={mappedIcon} style={style} />;
}
