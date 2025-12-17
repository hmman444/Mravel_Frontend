import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTokens } from "../../../utils/tokenManager";
import { decodeJwtPayload } from "../../../utils/jwt";
import { setTokensRedux, setRole } from "../slices/authSlice";

export const useHydrateRole = () => {
  const dispatch = useDispatch();
  const role = useSelector((s) => s.auth.role);

  useEffect(() => {
    if (role) return;

    const { accessToken, refreshToken } = getTokens();
    if (!accessToken) return;

    const payload = decodeJwtPayload(accessToken);
    const tokenRole = payload?.role;

    // set lại token vào redux nếu cần (đảm bảo redux có accessToken)
    dispatch(setTokensRedux({ accessToken, refreshToken }));

    if (tokenRole) dispatch(setRole(tokenRole));
  }, [role, dispatch]);
};
