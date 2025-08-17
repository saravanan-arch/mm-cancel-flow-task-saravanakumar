import React from "react";

export default function VisaSupportMessageBlock() {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-lg bg-[#F6F6F6]">
      <div className="flex flex-row gap-3">
        <img src="/mihailo-profile.jpeg" className="w-12 h-12 rounded-full" alt="Mihailo Bozic" />
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Mihailo Bozic</h3>
          <p className="text-sm text-[#62605C]">mihailo@migratemate.co</p>
        </div>
      </div>
      <div className="flex flex-col gap-5 pl-[60px]">
        <p className="text-sm text-[#62605C]">
          I'll be reaching out soon to help with the visa side of things.
        </p>
        <p className="text-sm text-[#62605C]">
          We've got your back, whether it's questions, paperwork, or just figuring out your options.
        </p>
        <p className="text-sm text-[#62605C]">
          Keep an eye on your inbox, I'll be in touch shortly.
        </p>
      </div>
    </div>
  );
}
