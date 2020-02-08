import { App } from "./../src/components/App";

describe(`<App /> component -- ${new Date().toLocaleString()}\r\n`, () => {
  const wrapper = mount(<App />);

  describe("renders correctly", () => {
    it("renders the correct amount of children", () => {
      expect(wrapper).to.have.lengthOf(1);
    });
  });
});