import BottomSheet from "@gorhom/bottom-sheet";
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from "react";

type AppBottomSheetProps = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  initialIndex?: number;
  enablePanDownToClose?: boolean;
};

export type AppBottomSheetRef = {
  open: () => void;
  close: () => void;
  snapTo: (index: number) => void;
};

export const AppBottomSheet = forwardRef<
  AppBottomSheetRef,
  AppBottomSheetProps
>(
  (
    {
      children,
      snapPoints = ["25%", "50%", "90%"],
      initialIndex = -1,
      enablePanDownToClose = true,
    },
    ref,
  ) => {
    const sheetRef = useRef<BottomSheet>(null);

    const points = useMemo(() => snapPoints, [snapPoints]);
    useImperativeHandle(ref, () => ({
      open: () => sheetRef.current?.expand(),
      close: () => sheetRef.current?.close(),
      snapTo: (index: number) => sheetRef.current?.snapToIndex(index),
    }));

    return (
      <BottomSheet
        ref={sheetRef}
        index={initialIndex}
        snapPoints={points}
        enablePanDownToClose={enablePanDownToClose}
      >
        {children}
      </BottomSheet>
    );
  },
);

AppBottomSheet.displayName = "AppBottomSheet";
