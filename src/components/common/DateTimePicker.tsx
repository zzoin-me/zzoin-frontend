import DatePickerNS from "react-multi-date-picker";
import TimePickerPluginNS from "react-multi-date-picker/plugins/time_picker";
import DateObjectNS from "react-date-object";
import "react-multi-date-picker/styles/layouts/mobile.css";
import { useIsMobile } from "@/utils/useMediaQuery";
import { formatKoreanDatetime, isoToLocalDatetimeInput } from "@/utils/datetime";

type DatePickerType = typeof DatePickerNS;
type DateObjectType = typeof DateObjectNS;

const DatePicker = DatePickerNS as unknown as
  { default: DatePickerType } | DatePickerType as DatePickerType & { default?: DatePickerType };
const DatePickerComponent = DatePicker.default ?? DatePicker;

const TimePickerPlugin = (TimePickerPluginNS as unknown as { default: typeof TimePickerPluginNS })
  .default;
const DateObject = DateObjectNS as unknown as
  { default: DateObjectType } | DateObjectType as DateObjectType & { default?: DateObjectType };
const DateObjectClass = DateObject.default ?? DateObject;

interface DateTimePickerProps {
  value: string;
  onChange: (iso: string) => void;
  label?: string;
  placeholder?: string;
}

function toDisplayString(iso: string): string {
  if (!iso) return "";
  const inputVal = isoToLocalDatetimeInput(iso);
  if (!inputVal) return "";
  return formatKoreanDatetime(inputVal);
}

export function DateTimePicker({
  value,
  onChange,
  label,
  placeholder = "날짜와 시간을 선택하세요",
}: DateTimePickerProps) {
  const isMobile = useIsMobile();

  const dateObject = value
    ? new DateObjectClass({
        date: new Date(value),
      })
    : undefined;

  const handleChange = (selected: unknown) => {
    if (!selected || Array.isArray(selected)) {
      onChange("");
      return;
    }
    const obj = selected as { toDate: () => Date };
    const jsDate = obj.toDate();
    const iso = `${jsDate.getFullYear()}-${String(jsDate.getMonth() + 1).padStart(2, "0")}-${String(jsDate.getDate()).padStart(2, "0")}T${String(jsDate.getHours()).padStart(2, "0")}:${String(jsDate.getMinutes()).padStart(2, "0")}:${String(jsDate.getSeconds()).padStart(2, "0")}`;
    onChange(iso);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      {label && <label className="font-medium text-[14px] text-grey8">{label}</label>}
      <DatePickerComponent
        value={dateObject}
        onChange={handleChange}
        format="YYYY-MM-DD HH:mm:ss"
        plugins={[<TimePickerPlugin key="time" position="bottom" hideSeconds />]}
        className={isMobile ? "rmdp-mobile" : undefined}
        mobileLabels={{ OK: "확인", CANCEL: "취소" }}
        render={(_stringDate: string, openCalendar: () => void) => (
          <button
            type="button"
            onClick={openCalendar}
            className="w-full rounded-tag border border-grey3 bg-bg px-4 py-3 text-left font-regular text-[16px] text-grey9 placeholder:text-grey6 focus:border-grey9 focus:outline-none"
          >
            {value ? toDisplayString(value) : <span className="text-grey6">{placeholder}</span>}
          </button>
        )}
      />
    </div>
  );
}
