declare module "react-native/Libraries/Image/resolveAssetSource" {
  import { ImageResolvedAssetSource, ImageSourcePropType } from "react-native";

  export default function resolveAssetSource(
    source: ImageSourcePropType,
  ): ImageResolvedAssetSource;
}
