// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;

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
} as IconMapping;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
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
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
