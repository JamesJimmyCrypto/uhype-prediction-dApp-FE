import BoringAvatar from "boring-avatars";

const blues = ["#0001fe", "#a000ff", "#70f8ff"];
const reds = ["#fb7ce8", "#FF0054", "#FAB400"];

const Avatar = ({
  address,
  zoomed = false,
  size = 30,
  deps,
  copy = true,
}: {
  address: string;
  zoomed?: boolean;
  size?: number;
  deps?: any[];
  copy?: boolean;
}) => {
  if (address === "") {
    return null;
  }

  // Ensure the address has enough length
  const addressArray = Array.from(address);
  const blueIndex = addressArray[5]?.charCodeAt(0) || 0;
  const redIndex = addressArray[6]?.charCodeAt(0) || 0;

  const blue = blues[blueIndex % blues.length];
  const red = reds[redIndex % reds.length];

  const blueFirst =
    addressArray.length > 10 ? parseInt(addressArray[10], 16) % 2 : 0;
  return (
    <div
      className="z-0"
      style={{
        height: size,
        width: size,
        overflow: "hidden",
        borderRadius: "50%",
      }}
    >
      <BoringAvatar
        size={size}
        name={address}
        variant="beam"
        colors={blueFirst ? [blue, red] : [red, blue]}
      />
    </div>
  );
};

export default Avatar;
