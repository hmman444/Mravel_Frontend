let injectedStore = null;

export const injectStore = (store) => {
  injectedStore = store;
};

export const getStore = () => injectedStore;
