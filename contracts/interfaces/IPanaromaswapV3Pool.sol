// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.5.0;

import './pool/IPanaromaswapV3PoolImmutables.sol';
import './pool/IPanaromaswapV3PoolState.sol';
import './pool/IPanaromaswapV3PoolDerivedState.sol';
import './pool/IPanaromaswapV3PoolActions.sol';
import './pool/IPanaromaswapV3PoolOwnerActions.sol';
import './pool/IPanaromaswapV3PoolEvents.sol';

/// @title The interface for a Panaromaswap V3 Pool
/// @notice A Panaromaswap pool facilitates swapping and automated market making between any two assets that strictly conform
/// to the ERC20 specification
/// @dev The pool interface is broken up into many smaller pieces
interface IPanaromaswapV3Pool is
    IPanaromaswapV3PoolImmutables,
    IPanaromaswapV3PoolState,
    IPanaromaswapV3PoolDerivedState,
    IPanaromaswapV3PoolActions,
    IPanaromaswapV3PoolOwnerActions,
    IPanaromaswapV3PoolEvents
{

}
