function Group() {
  return (
    <div className="absolute contents left-[74px] top-[102px]">
      <div className="absolute bg-white h-[150px] left-[74px] rounded-[5px] top-[102px] w-[379px]" />
      <div className="absolute bg-[#571977] h-[46px] left-[74px] rounded-tl-[5px] rounded-tr-[5px] top-[102px] w-[379px]" />
      <p className="absolute font-['Roboto:Bold',sans-serif] font-bold leading-[normal] left-[86px] text-[15px] text-white top-[108px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        Echoes of Eternity
      </p>
      <p className="absolute font-['Roboto:Bold',sans-serif] font-bold leading-[normal] left-[392px] text-[15px] text-white top-[108px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        $25.00
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[86px] not-italic text-[12px] text-white top-[126px] whitespace-nowrap">by Liam Johnson</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[374px] not-italic text-[12px] text-white top-[126px] whitespace-nowrap">10/05/2025</p>
      <div className="absolute bg-[#571977] h-[43px] left-[87px] rounded-[5px] top-[165px] w-[107px]" />
      <div className="absolute bg-[#caabd5] h-[43px] left-[207px] rounded-[5px] top-[165px] w-[107px]" />
      <div className="absolute bg-[#4caf50] h-[43px] left-[327px] rounded-[5px] top-[165px] w-[107px]" />
      <div className="absolute bg-[#1976d2] h-[27px] left-[87px] rounded-[10px] top-[220px] w-[170px]" />
      <div className="absolute bg-[#ff3d00] h-[27px] left-[265px] rounded-[10px] top-[220px] w-[170px]" />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white relative size-full">
      <Group />
    </div>
  );
}