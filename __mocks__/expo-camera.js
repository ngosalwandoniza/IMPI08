export const Camera = {
  Constants: {
    BarCodeType: {
      qr: 'qr',
    },
  },
  requestCameraPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
};
export default Camera; 