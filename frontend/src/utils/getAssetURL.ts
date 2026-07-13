import getBaseURL from "@/utils/getBaseURL";

const getAssetURL = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;

  return `${new URL(getBaseURL()).origin}${path.startsWith("/") ? path : `/${path}`}`;
};

export default getAssetURL;
