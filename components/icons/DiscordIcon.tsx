const DiscordIcon = ({ fill = "black" }: { fill?: string }) => {
  return (
    <svg
      width="21"
      height="16"
      viewBox="0 0 21 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.77 1.32631C16.4321 0.71242 14.9974 0.260131 13.4973 0.00108666C13.47 -0.00391282 13.4427 0.00858115 13.4286 0.0335697C13.2441 0.361747 13.0397 0.789881 12.8966 1.12639C11.2832 0.884845 9.67803 0.884845 8.09768 1.12639C7.95452 0.782401 7.74272 0.361747 7.55737 0.0335697C7.5433 0.00941489 7.51601 -0.00307908 7.48869 0.00108666C5.98944 0.259303 4.55473 0.711592 3.21599 1.32631C3.2044 1.33131 3.19446 1.33965 3.18787 1.35047C0.466525 5.4161 -0.278966 9.3818 0.0867467 13.2983C0.0884015 13.3175 0.0991576 13.3358 0.114051 13.3475C1.90952 14.666 3.64873 15.4665 5.35565 15.9971C5.38297 16.0054 5.41191 15.9954 5.4293 15.9729C5.83307 15.4215 6.193 14.8401 6.5016 14.2287C6.51981 14.1929 6.50243 14.1504 6.46521 14.1363C5.8943 13.9197 5.35069 13.6557 4.82777 13.3558C4.7864 13.3317 4.78309 13.2725 4.82114 13.2442C4.93118 13.1617 5.04126 13.0759 5.14633 12.9893C5.16534 12.9735 5.19183 12.9701 5.21418 12.9801C8.64954 14.5486 12.3687 14.5486 15.7636 12.9801C15.7859 12.9693 15.8124 12.9726 15.8322 12.9885C15.9373 13.0751 16.0474 13.1617 16.1583 13.2442C16.1963 13.2725 16.1938 13.3317 16.1525 13.3558C15.6295 13.6615 15.0859 13.9197 14.5142 14.1354C14.477 14.1496 14.4604 14.1929 14.4786 14.2287C14.7938 14.8393 15.1538 15.4207 15.5501 15.9721C15.5667 15.9954 15.5964 16.0054 15.6237 15.9971C17.3389 15.4665 19.0781 14.666 20.8736 13.3475C20.8893 13.3358 20.8993 13.3183 20.9009 13.2992C21.3386 8.77122 20.1678 4.83804 17.7973 1.3513C17.7915 1.33965 17.7816 1.33131 17.77 1.32631ZM7.01462 10.9136C5.98034 10.9136 5.12812 9.96403 5.12812 8.79789C5.12812 7.63175 5.96381 6.6822 7.01462 6.6822C8.07367 6.6822 8.91764 7.64009 8.90108 8.79789C8.90108 9.96403 8.06539 10.9136 7.01462 10.9136ZM13.9896 10.9136C12.9554 10.9136 12.1031 9.96403 12.1031 8.79789C12.1031 7.63175 12.9388 6.6822 13.9896 6.6822C15.0487 6.6822 15.8926 7.64009 15.8761 8.79789C15.8761 9.96403 15.0487 10.9136 13.9896 10.9136Z"
        fill={fill}
      />
    </svg>
  );
};

export default DiscordIcon;