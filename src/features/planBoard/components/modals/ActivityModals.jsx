// src/features/planBoard/components/ActivityModals.jsx
"use client";

import TransportActivityModal from "./TransportActivityModal";
import FoodActivityModal from "./FoodActivityModal";
import StayActivityModal from "./StayActivityModal";
import SightseeingActivityModal from "./SightseeingActivityModal";
import EntertainmentActivityModal from "./EntertainActivityModal";
import EventActivityModal from "./EventActivityModal";
import ShoppingActivityModal from "./ShoppingActivityModal";
import CinemaActivityModal from "./CinemaActivityModal";
import OtherActivityModal from "./OtherActivityModal";

export default function ActivityModals({
  modalStates,
  closeModal,
  handleSubmitActivity,
  editingCard,
  planMembers,
  readOnly,
}) {
  return (
    <>
      <TransportActivityModal
        open={modalStates.TRANSPORT[0]}
        onClose={() => closeModal("TRANSPORT")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={readOnly}
      />
      <FoodActivityModal
        open={modalStates.FOOD[0]}
        onClose={() => closeModal("FOOD")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={readOnly}
      />
      <StayActivityModal
        open={modalStates.STAY[0]}
        onClose={() => closeModal("STAY")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={readOnly}
      />
      <SightseeingActivityModal
        open={modalStates.SIGHTSEEING[0]}
        onClose={() => closeModal("SIGHTSEEING")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={readOnly}
      />
      <EntertainmentActivityModal
        open={modalStates.ENTERTAIN[0]}
        onClose={() => closeModal("ENTERTAIN")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={readOnly}
      />
      <ShoppingActivityModal
        open={modalStates.SHOPPING[0]}
        onClose={() => closeModal("SHOPPING")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={readOnly}
      />
      <CinemaActivityModal
        open={modalStates.CINEMA[0]}
        onClose={() => closeModal("CINEMA")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={readOnly}
      />
      <EventActivityModal
        open={modalStates.EVENT[0]}
        onClose={() => closeModal("EVENT")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={readOnly}
      />
      <OtherActivityModal
        open={modalStates.OTHER[0]}
        onClose={() => closeModal("OTHER")}
        onSubmit={handleSubmitActivity}
        editingCard={editingCard}
        planMembers={planMembers}
        readOnly={readOnly}
      />
    </>
  );
}
