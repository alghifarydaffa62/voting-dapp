import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("VotingFactoryModule", (m) => {
  const votingFactory = m.contract("VotingFactory");

  return { votingFactory };
});
