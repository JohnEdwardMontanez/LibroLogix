import imgRectangle39 from "../../assets/logo.png";

function Frame() {
  return (
    <div className="content-stretch flex flex-col gap-[3px] h-[68px] items-center justify-center relative shrink-0 w-full">
      <p className="font-['Roboto:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#571977] text-[20px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        Username
      </p>
      <div className="bg-[#caabd5] h-[51px] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-full" />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col gap-[3px] h-[68px] items-center justify-center relative shrink-0 w-full">
      <p className="font-['Roboto:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[#571977] text-[20px] w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        Password
      </p>
      <div className="bg-[#caabd5] h-[51px] rounded-[5px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-full" />
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-[#caabd5] h-[51px] relative rounded-[5px] shrink-0 w-full">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[129px] pr-[130px] py-[11px] relative size-full">
          <p className="font-['Roboto:SemiBold',sans-serif] font-semibold leading-[normal] relative shrink-0 text-[25px] text-white whitespace-nowrap" style={{ fontVariationSettings: "'wdth' 100" }}>
            Login
          </p>
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[40px] items-center left-[47px] top-[282px] w-[322px]">
      <p className="font-['Roboto:Bold',sans-serif] font-bold leading-[normal] relative shrink-0 text-[25px] text-black text-center w-full" style={{ fontVariationSettings: "'wdth' 100" }}>
        Admin Page
      </p>
      <Frame />
      <Frame1 />
      <Frame2 />
    </div>
  );
}

export default function Login() {
  return (
    <div className="bg-white relative size-full" data-name="Login">
      <div className="absolute bg-white h-[423px] left-[30px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[242px] w-[355px]" />
      <Frame3 />
      <div className="absolute h-[109px] left-[30px] top-[133px] w-[355px]">
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 overflow-hidden">
            <img alt="" className="absolute h-[161.13%] left-[2.3%] max-w-none top-[-25.21%] w-full" src={imgRectangle39} />
          </div>
          <div className="absolute inset-0 overflow-hidden">
            <img alt="" className="absolute h-[161.13%] left-[0.09%] max-w-none top-[-25.21%] w-[102.27%]" src={imgRectangle39} />
          </div>
        </div>
      </div>
    </div>
  );
}