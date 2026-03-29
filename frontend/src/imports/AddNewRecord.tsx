function Group() {
  return (
    <div className="absolute contents left-[19px] top-[197px]">
      <div className="absolute bg-white h-[395px] left-[19px] rounded-bl-[5px] rounded-br-[5px] top-[197px] w-[374px]" />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[45px] top-[216px]">
      <p className="absolute font-['Roboto:SemiBold',sans-serif] font-semibold leading-[normal] left-[45px] text-[#571977] text-[20px] top-[216px] w-[322px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Book Name
      </p>
      <div className="absolute bg-[#caabd5] h-[51px] left-[45px] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[242px] w-[322px]" />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[45px] top-[418px]">
      <p className="absolute font-['Roboto:SemiBold',sans-serif] font-semibold leading-[normal] left-[45px] text-[#571977] text-[20px] top-[418px] w-[322px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Published Date
      </p>
      <div className="absolute bg-[#caabd5] h-[51px] left-[45px] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[444px] w-[322px]" />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[45px] top-[317px]">
      <p className="absolute font-['Roboto:SemiBold',sans-serif] font-semibold leading-[normal] left-[45px] text-[#571977] text-[20px] top-[317px] w-[322px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        Author
      </p>
      <div className="absolute bg-[#caabd5] h-[51px] left-[45px] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[343px] w-[322px]" />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[19px] top-[142px]">
      <div className="absolute bg-[#571977] h-[55px] left-[19px] rounded-tl-[5px] rounded-tr-[5px] top-[142px] w-[374px]" />
      <p className="absolute font-['Roboto:Bold',sans-serif] font-bold leading-[normal] left-[105px] text-[20px] text-white top-[158px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        ADDING NEW RECORD
      </p>
    </div>
  );
}

export default function AddNewRecord() {
  return (
    <div className="bg-white relative size-full" data-name="Add New Record">
      <Group />
      <Group1 />
      <Group3 />
      <div className="absolute bg-[#571977] h-[51px] left-[45px] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[519px] w-[153px]" />
      <div className="absolute bg-white h-[51px] left-[214px] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[519px] w-[153px]" />
      <Group2 />
      <p className="absolute font-['Roboto:Bold',sans-serif] font-bold leading-[normal] left-[253px] text-[20px] text-black top-[533px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        CANCEL
      </p>
      <p className="absolute font-['Roboto:Bold',sans-serif] font-bold leading-[normal] left-[102px] text-[20px] text-white top-[533px] whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
        ADD
      </p>
      <Group4 />
    </div>
  );
}