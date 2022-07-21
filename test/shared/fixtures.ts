import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MockTimePanaromaswapV3Pool } from '../../typechain/MockTimePanaromaswapV3Pool'
import { TestERC20 } from '../../typechain/TestERC20'
import { PanaromaswapV3Factory } from '../../typechain/PanaromaswapV3Factory'
import { TestPanaromaswapV3Callee } from '../../typechain/TestPanaromaswapV3Callee'
import { TestPanaromaswapV3Router } from '../../typechain/TestPanaromaswapV3Router'
import { MockTimePanaromaswapV3PoolDeployer } from '../../typechain/MockTimePanaromaswapV3PoolDeployer'

import { Fixture } from 'ethereum-waffle'

interface FactoryFixture {
  factory: PanaromaswapV3Factory
}

async function factoryFixture(): Promise<FactoryFixture> {
  const factoryFactory = await ethers.getContractFactory('PanaromaswapV3Factory')
  const factory = (await factoryFactory.deploy()) as PanaromaswapV3Factory
  return { factory }
}

interface TokensFixture {
  token0: TestERC20
  token1: TestERC20
  token2: TestERC20
}

async function tokensFixture(): Promise<TokensFixture> {
  const tokenFactory = await ethers.getContractFactory('TestERC20')
  const tokenA = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenB = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20
  const tokenC = (await tokenFactory.deploy(BigNumber.from(2).pow(255))) as TestERC20

  const [token0, token1, token2] = [tokenA, tokenB, tokenC].sort((tokenA, tokenB) =>
    tokenA.address.toLowerCase() < tokenB.address.toLowerCase() ? -1 : 1
  )

  return { token0, token1, token2 }
}

type TokensAndFactoryFixture = FactoryFixture & TokensFixture

interface PoolFixture extends TokensAndFactoryFixture {
  swapTargetCallee: TestPanaromaswapV3Callee
  swapTargetRouter: TestPanaromaswapV3Router
  createPool(
    fee: number,
    tickSpacing: number,
    firstToken?: TestERC20,
    secondToken?: TestERC20
  ): Promise<MockTimePanaromaswapV3Pool>
}

// Monday, October 5, 2020 9:00:00 AM GMT-05:00
export const TEST_POOL_START_TIME = 1601906400

export const poolFixture: Fixture<PoolFixture> = async function (): Promise<PoolFixture> {
  const { factory } = await factoryFixture()
  const { token0, token1, token2 } = await tokensFixture()

  const MockTimePanaromaswapV3PoolDeployerFactory = await ethers.getContractFactory('MockTimePanaromaswapV3PoolDeployer')
  const MockTimePanaromaswapV3PoolFactory = await ethers.getContractFactory('MockTimePanaromaswapV3Pool')

  const calleeContractFactory = await ethers.getContractFactory('TestPanaromaswapV3Callee')
  const routerContractFactory = await ethers.getContractFactory('TestPanaromaswapV3Router')

  const swapTargetCallee = (await calleeContractFactory.deploy()) as TestPanaromaswapV3Callee
  const swapTargetRouter = (await routerContractFactory.deploy()) as TestPanaromaswapV3Router

  return {
    token0,
    token1,
    token2,
    factory,
    swapTargetCallee,
    swapTargetRouter,
    createPool: async (fee, tickSpacing, firstToken = token0, secondToken = token1) => {
      const mockTimePoolDeployer = (await MockTimePanaromaswapV3PoolDeployerFactory.deploy()) as MockTimePanaromaswapV3PoolDeployer
      const tx = await mockTimePoolDeployer.deploy(
        factory.address,
        firstToken.address,
        secondToken.address,
        fee,
        tickSpacing
      )

      const receipt = await tx.wait()
      const poolAddress = receipt.events?.[0].args?.pool as string
      return MockTimePanaromaswapV3PoolFactory.attach(poolAddress) as MockTimePanaromaswapV3Pool
    },
  }
}
