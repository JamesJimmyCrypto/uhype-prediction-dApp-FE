import { Tab } from "@headlessui/react";

const SubTabsList = ({ titles }: { titles: string[] }) => {
  return (
    <Tab.List className="mb-10 flex border-b-1 border-sky-200 py-3">
      {titles.map((title, index) => (
        <Tab className="px-4" key={index}>
          {({ selected }) => (
            <div
              className={
                selected
                  ? "text-white-200 font-semibold transition-all"
                  : "text-white-600 transition-all"
              }
            >
              {title}
            </div>
          )}
        </Tab>
      ))}
    </Tab.List>
  );
};

export default SubTabsList;
