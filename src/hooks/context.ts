/* eslint-disable array-callback-return */
import React, { useState } from "react";
export interface IDndSystemState {
  viewModalStructure: IDndViewModel[];
  draggingViewModels: IDndViewModel[];
  dropTargetViewModal: IDndViewModel | null;
  dropInfo: IDropInfo | null;
}

export interface IDndSystemContext {
  dndSystemState: IDndSystemState;
  dndResizeHandler: (viewModal: IDndViewModel, resizeInfo: IResizeInfo) => void;
  dndDropHandler: (dropInfo: IDropInfo) => void;
  dndAddCanDropFilter: (canDropFilter: ICanDropFilter) => void;
  dndClearDropFilters: () => void;
  dndFindParentViewModal: (
    childViewModal: IDndViewModel | undefined | null,
    fromViewModals: IDndViewModel[]
  ) => IDndViewModel | null;
  dndAddViewModal: (
    viewModalToAdd: IDndViewModel,
    parentViewModal?: IDndViewModel
  ) => boolean;
  dndRemoveViewModal: (viewModalToRemove: IDndViewModel) => boolean;
  dndUpdateViewModal: (viewModalToUpdate: IDndViewModel) => boolean;
  dndMoveViewModal: (
    viewModalToMove: IDndViewModel,
    newParentViewModal?: IDndViewModel
  ) => boolean;
  dndSetDropInfo: (dropInfo: IDropInfo | null) => void;
  dndAddDraggingViewModal: (viewModal: IDndViewModel, append?: boolean) => void;
  dndRemoveDraggingViewModal: (viewModal: IDndViewModel) => void;
  dndRemoveAllDraggingViewModals: () => void;
  dndSetDropTargetViewModal: (viewModal: IDndViewModel | null) => void;
}

const searchToAdd = (
  viewModalArray: IDndViewModel[],
  viewModalToAdd: IDndViewModel,
  parentViewModal?: IDndViewModel,
  added: Boolean = false
) => {
  if (!added) {
    if (!parentViewModal) {
      viewModalArray.push(viewModalToAdd);
      return true;
    }
    for (let i = 0; i < viewModalArray.length; i++) {
      const viewModal = viewModalArray[i];
      if (viewModal.id === parentViewModal.id) {
        if (!Array.isArray(viewModal.children)) {
          viewModal.children = [];
        }
        viewModal.children.push(viewModalToAdd);
        added = true;
        break;
      } else if (Array.isArray(viewModal.children)) {
        added = searchToAdd(
          viewModal.children,
          viewModalToAdd,
          parentViewModal,
          added
        );
        if (added) {
          break;
        }
      }
    }
  }
  return added;
};

const searchToRemove = (
  viewModalArray: IDndViewModel[],
  viewModalToRemove: IDndViewModel,
  removed: Boolean = false
) => {
  if (!removed) {
    for (let i = 0; i < viewModalArray.length; i++) {
      const viewModal = viewModalArray[i];
      if (viewModal.id === viewModalToRemove.id) {
        viewModalArray.splice(i, 1);
        removed = true;
        break;
      } else if (Array.isArray(viewModal.children)) {
        removed = searchToRemove(
          viewModal.children,
          viewModalToRemove,
          removed
        );
        if (removed) {
          break;
        }
      }
    }
  }
  return removed;
};

const searchToUpdate = (
  viewModalArray: IDndViewModel[],
  viewModalToUpdate: IDndViewModel,
  updated: Boolean = false
) => {
  if (!updated) {
    for (let i = 0; i < viewModalArray.length; i++) {
      const viewModal = viewModalArray[i];
      if (viewModal.id === viewModalToUpdate.id) {
        viewModalArray[i] = viewModalToUpdate;
        updated = true;
        break;
      } else if (Array.isArray(viewModal.children)) {
        updated = searchToUpdate(
          viewModal.children,
          viewModalToUpdate,
          updated
        );
        if (updated) {
          break;
        }
      }
    }
  }
  return updated;
};

export const useInitialDndSystemContext: () => IDndSystemContext = () => {
  const [dndSystemState, setDndSystemState] = useState<IDndSystemState>({
    viewModalStructure: [],
    draggingViewModels: [],
    dropTargetViewModal: null,
    dropInfo: null,
  });

  const utilViewModalCanDropFilter = (
    viewModals: IDndViewModel[],
    toViewModal: IDndViewModel | null | undefined
  ) => {
    if (toViewModal === undefined || toViewModal === null) {
      return true;
    } else {
      const isInvalidTarget = (
        viewModals: IDndViewModel[],
        toViewModal: IDndViewModel
      ) => {
        return viewModals.reduce((accumulator, viewModal) => {
          if (accumulator) {
            return accumulator;
          }
          if (viewModal.id === toViewModal.id) {
            accumulator = true;
          } else if (
            dndFindParentViewModal(viewModal, [toViewModal]) !== null
          ) {
            accumulator = true;
          } else if (Array.isArray(viewModal.children)) {
            if (isInvalidTarget(viewModal.children, toViewModal)) {
              accumulator = true;
            }
          }
          return accumulator;
        }, false);
      };
      return !isInvalidTarget(viewModals, toViewModal);
    }
  };

  const dndAddViewModal = (
    viewModalToAdd: IDndViewModel,
    parentViewModal?: IDndViewModel
  ) => {
    const viewModalArray = [...dndSystemState.viewModalStructure];
    if (searchToAdd(viewModalArray, viewModalToAdd, parentViewModal, false)) {
      setDndSystemState({
        ...dndSystemState,
        viewModalStructure: viewModalArray,
      });
      return true;
    }
    return false;
  };

  const dndUpdateViewModal = (viewModalToUpdate: IDndViewModel) => {
    const viewModalArray = [...dndSystemState.viewModalStructure];
    if (searchToUpdate(viewModalArray, viewModalToUpdate, false)) {
      setDndSystemState({
        ...dndSystemState,
        viewModalStructure: viewModalArray,
      });
      return true;
    }
    return false;
  };

  const dndRemoveViewModal = (viewModalToRemove: IDndViewModel) => {
    const viewModalArray = [...dndSystemState.viewModalStructure];
    if (searchToRemove(viewModalArray, viewModalToRemove, false)) {
      setDndSystemState({
        ...dndSystemState,
        viewModalStructure: viewModalArray,
      });
      return true;
    }
    return false;
  };

  const dndMoveViewModal = (
    viewModalToMove: IDndViewModel,
    newParentViewModal?: IDndViewModel
  ) => {
    const viewModalArray = [...dndSystemState.viewModalStructure];
    const removed = searchToRemove(viewModalArray, viewModalToMove, false);
    const added = searchToAdd(
      viewModalArray,
      viewModalToMove,
      newParentViewModal,
      false
    );
    if (removed || added) {
      setDndSystemState({
        ...dndSystemState,
        viewModalStructure: viewModalArray,
      });
      return true;
    }
    return false;
  };

  const canDropFilters: ICanDropFilter[] = [utilViewModalCanDropFilter];

  const dndResizeHandler = (
    viewModal: IDndViewModel,
    resizeInfo: IResizeInfo
  ) => {
    const { width, height, resizeDirection, dx = 0, dy = 0 } = resizeInfo;
    let update = false;
    if (width && width > 0) {
      viewModal.style.width = width;
      update = true;
    }
    if (height && height > 0) {
      viewModal.style.height = height;
      update = true;
    }

    if (update) {
      if (resizeDirection?.includes("w")) {
        viewModal.style.left = (viewModal.style.left as number) - dx;
      }
      if (resizeDirection?.includes("n")) {
        viewModal.style.top = (viewModal.style.top as number) - dy;
      }
      dndUpdateViewModal(viewModal);
    }
  };

  const dndDropHandler = (dropInfo: IDropInfo) => {
    console.log("!!!DropHandler: ", dropInfo);
    const {
      viewModals,
      pos,
      toViewModal,
      mouseDownAtViewPos,
      translation,
    } = dropInfo;
    if (!toViewModal) {
      viewModals.map((viewModalToDrop) => {
        console.log("111111", viewModalToDrop.style, translation);
        viewModalToDrop.style.left =
          (viewModalToDrop.style.left as number) + translation.x;
        viewModalToDrop.style.top =
          (viewModalToDrop.style.top as number) + translation.y;
        dndUpdateViewModal(viewModalToDrop);
        // dndMoveViewModal(viewModalToDrop, toViewModal);
      });
    } else {
      const canDrop = canDropFilters.reduce(
        (accumulator, filter) => accumulator && filter(viewModals, toViewModal),
        true
      );
      if (canDrop) {
        viewModals.map((viewModalToDrop) => {
          console.log("222222", viewModalToDrop.style, mouseDownAtViewPos);
          if (viewModalToDrop.style && toViewModal.viewRef) {
            const boundingRect = toViewModal.viewRef.current!.getBoundingClientRect();
            viewModalToDrop.style.left = pos.x - boundingRect.x;
            viewModalToDrop.style.top = pos.y - boundingRect.y;
            dndUpdateViewModal(viewModalToDrop);
            dndMoveViewModal(viewModalToDrop, toViewModal);
          }
        });
      } else {
        viewModals.map((viewModalToDrop) => {
          console.log("333333", viewModalToDrop.style, translation);
          if (viewModalToDrop.style) {
            viewModalToDrop.style.left =
              (viewModalToDrop.style.left as number) + translation.x;
            viewModalToDrop.style.top =
              (viewModalToDrop.style.top as number) + translation.y;
            dndUpdateViewModal(viewModalToDrop);
          }
        });
      }
    }
  };

  const dndFindParentViewModal = (
    childViewModal: IDndViewModel | undefined | null,
    fromViewModals: IDndViewModel[]
  ) => {
    if (childViewModal === undefined || childViewModal === null) {
      return null;
    }
    return fromViewModals.reduce<IDndViewModel | null>(
      (accumulator, viewModal) => {
        if (Array.isArray(viewModal.children)) {
          viewModal.children.map((child) => {
            if (child.id === childViewModal.id) {
              accumulator = viewModal;
            } else if (Array.isArray(child.children)) {
              const result = dndFindParentViewModal(
                childViewModal,
                child.children
              );
              if (result) {
                accumulator = result;
              }
            }
          });
        }
        return accumulator;
      },
      null
    );
  };

  return {
    dndSystemState,
    dndResizeHandler,
    dndDropHandler,
    dndAddCanDropFilter: (canDropFilter: ICanDropFilter) =>
      canDropFilters.push(canDropFilter),
    dndClearDropFilters: () => canDropFilters.splice(0, canDropFilters.length),
    dndFindParentViewModal,
    dndAddViewModal,
    dndRemoveViewModal,
    dndUpdateViewModal,
    dndMoveViewModal,
    dndSetDropInfo: (dropInfo: IDropInfo | null) =>
      setDndSystemState((state) => ({
        ...state,
        dropInfo: dropInfo,
      })),
    dndAddDraggingViewModal: (viewModal: IDndViewModel, append = false) =>
      setDndSystemState((state) => ({
        ...state,
        draggingViewModels: append
          ? [...state.draggingViewModels, viewModal]
          : [viewModal],
      })),
    dndRemoveDraggingViewModal: (viewModal: IDndViewModel) =>
      setDndSystemState((state) => ({
        ...state,
        draggingViewModels: state.draggingViewModels.filter(
          (it) => it.id !== viewModal.id
        ),
      })),
    dndRemoveAllDraggingViewModals: () =>
      setDndSystemState((state) => ({ ...state, draggingViewModels: [] })),
    dndSetDropTargetViewModal: (viewModal: IDndViewModel | null) =>
      setDndSystemState((state) => ({
        ...state,
        dropTargetViewModal: viewModal,
      })),
  };
};

export const DndSystemContext = React.createContext<IDndSystemContext>(
  {} as any
);
