import React from 'react';
import Svg, { Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

interface HomeIconProps {
    size?: number;
    color?: string;
}

export function HomeIcon({ size = 24, color }: HomeIconProps) {
    // Original viewBox: 0 0 127.70166 251.9111
    // Scale to fit the size while maintaining aspect ratio
    const aspectRatio = 127.70166 / 251.9111;
    const height = size;
    const width = size * aspectRatio;

    return (
        <Svg
            width={width}
            height={height}
            viewBox="0 0 127.70166 251.9111"
        >
            <Defs>
                <LinearGradient
                    id="homeIconGradient"
                    x1="362.33325"
                    y1="543.14252"
                    x2="314.49628"
                    y2="440.12012"
                    gradientUnits="userSpaceOnUse"
                >
                    <Stop offset="0" stopColor={color || "#ebc3e5"} stopOpacity={1} />
                    <Stop offset="1" stopColor={color || "#b8ceff"} stopOpacity={1} />
                </LinearGradient>
            </Defs>
            <G transform="translate(-327.47006,-360.29544)">
                <Path
                    d="m 384.81782,452.15214 -20.72637,76.65253 c -3.11547,11.5215 3.77989,23.52574 15.30224,26.64287 11.52109,3.11671 23.52827,-3.77903 26.64247,-15.30097 l 35.18077,-130.10989 c 4.17397,-15.43731 -5.02362,-31.45687 -20.46345,-35.6317 -15.86936,-4.29043 -31.99234,4.25814 -36.32299,20.27714 l -42.75728,158.1326 c -5.28841,19.55797 6.36038,39.84517 25.92005,45.13274 19.72196,5.332 40.04009,-6.08147 45.38734,-25.85316 l 28.83638,-106.65212 12.46612,3.36825 -28.83851,106.65423 c -7.14886,26.44204 -34.52756,42.16593 -60.96793,35.01622 -26.60475,-7.19205 -42.47473,-34.38624 -35.26872,-61.03693 L 371.96565,391.3143 c 6.03487,-22.32264 29.14678,-35.59787 51.46774,-29.56216 22.75427,6.1568 36.43948,28.75773 30.24837,51.65658 l -35.17992,130.10736 c -4.97635,18.40263 -24.07587,29.37182 -42.47892,24.39674 -18.40263,-4.97635 -29.37309,-24.07628 -24.39674,-42.47892 l 20.72639,-76.65253 12.46527,3.37072"
                    fill={color || "url(#homeIconGradient)"}
                    fillOpacity={1}
                    fillRule="evenodd"
                />
            </G>
        </Svg>
    );
}
