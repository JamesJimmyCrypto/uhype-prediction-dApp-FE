import { PortableText } from "@portabletext/react";
import { isArray, isString } from "lodash-es";
import dynamic from "next/dynamic";
import { Market } from "@/src/types";

const QuillViewer = dynamic(() => import("components/ui/QuillViewer"), {
  ssr: false,
});

export const MarketDescription = ({ market }: { market: Market }) => {
  const description = market.description;

  return (
    <>
      {isArray(description) && description.length ? (
        <>
          <h3 className="mb-5 text-2xl">About Market</h3>
          <PortableText value={description} />
        </>
      ) : (
        isString(description) &&
        description?.length > 0 && (
          <>
            <h3 className="mb-5 text-2xl">About Market</h3>
            <QuillViewer value={description} />
          </>
        )
      )}
    </>
  );
};
