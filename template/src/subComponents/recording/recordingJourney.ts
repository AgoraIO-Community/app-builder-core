export const runPostStartRecordingLayoutUpdate = async (
  updateLayout: () => Promise<void>,
  onFailure: (error: unknown) => void,
) => {
  try {
    await updateLayout();
    return true;
  } catch (error) {
    onFailure(error);
    return false;
  }
};
