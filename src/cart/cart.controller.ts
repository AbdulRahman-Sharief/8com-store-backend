import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { Request, Response } from 'express';
import { RolesGuard } from 'src/auth/guards/role-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { USERS_ROLES } from 'config/constants/constants';
import { Types } from 'mongoose';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async create(
    @Body() createCartDto: CreateCartDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const { items } = createCartDto;
      const newCart = await this.cartService.create({
        items,
        customer: req.user.userId,
      });
      if (!newCart) {
        throw new Error(
          'Cart creation failed, possibly due to duplicate entry.',
        );
      }

      return res.status(HttpStatus.CREATED).json({
        status: 'success',
        message: 'Cart created successfully',
        data: newCart,
      });
    } catch (error) {
      throw new Error(`Failed to create cart: ${error.message}`);
    }
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles([USERS_ROLES.ADMIN])
  async findAll(@Res() res: Response) {
    try {
      const allCarts = await this.cartService.findAll();
      if (!allCarts || allCarts.length === 0) {
        throw new Error(
          'No carts found. Please ensure carts exist in the database.',
        );
      }

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Carts retrieved successfully',
        data: allCarts,
      });
    } catch (error) {
      throw new Error(`Failed to retrieve carts: ${error.message}`);
    }
  }

  @Get('/customer')
  async findOneCartOfCustomer(@Req() req: Request, @Res() res: Response) {
    try {
      const userId = req.user.userId;
      const cart = await this.cartService.findOneCartOfCustomer(userId);
      if (!cart) {
        return res.status(HttpStatus.NOT_FOUND).json({
          status: 'failed',
          message: 'No cart found for this customer.',
        });
      }

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Cart retrieved successfully',
        data: cart,
      });
    } catch (error) {
      throw new Error(`Failed to retrieve carts: ${error.message}`);
    }
  }

  @Get(':cartId')
  async findOne(@Param('cartId') cartId: string, @Res() res: Response) {
    try {
      if (
        !(
          Types.ObjectId.isValid(cartId) &&
          new Types.ObjectId(cartId).toString() === cartId
        )
      )
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'not valid cart ID.',
        });

      const cartDB = await this.cartService.findOne(cartId);
      if (!cartDB) {
        throw new Error(
          'No cart found. Please ensure cart exist in the database.',
        );
      }

      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Cart retrieved successfully',
        data: cartDB,
      });
    } catch (error) {
      throw new Error(`Failed to retrieve carts: ${error.message}`);
    }
  }

  @Patch(':cartId')
  async update(
    @Param('cartId') cartId: string,
    @Body() updateCartDto: UpdateCartDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      console.log('updateCartDto', updateCartDto);
      const userId = req.user.userId;
      if (
        !(
          Types.ObjectId.isValid(cartId) &&
          new Types.ObjectId(cartId).toString() === cartId
        )
      )
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'not valid cart ID.',
        });

      const cartDB = await this.cartService.findOne(cartId);
      if (!cartDB) {
        throw new Error(
          'No cart found. Please ensure cart exist in the database.',
        );
      }

      if (cartDB.customer._id.toString() !== userId.toString()) {
        return res.status(HttpStatus.FORBIDDEN).json({
          status: 'failed',
          message: 'You are not authorized to update this cart.',
        });
      }
      const updatedCart = await this.cartService.update(cartId, updateCartDto);

      if (!updatedCart) {
        throw new Error('Cart update failed. Please try again.');
      }
      return res.status(HttpStatus.OK).json({
        status: 'success',
        message: 'Cart updated successfully',
        data: updatedCart,
      });
    } catch (error) {
      throw new Error(`Failed to retrieve cart: ${error.message}`);
    }
  }

  @Delete(':cartId')
  async remove(@Param('cartId') cartId: string, @Res() res: Response) {
    try {
      if (
        !(
          Types.ObjectId.isValid(cartId) &&
          new Types.ObjectId(cartId).toString() === cartId
        )
      )
        return res.status(HttpStatus.BAD_REQUEST).json({
          status: 'failed',
          message: 'not valid cart ID.',
        });

      const cartDB = await this.cartService.findOne(cartId);
      if (!cartDB) {
        throw new Error(
          'No cart found. Please ensure cart exist in the database.',
        );
      }
      const deletedCart = await this.cartService.remove(cartId);

      if (!deletedCart) {
        throw new Error('Cart deletion failed. Please try again.');
      }
      return res.status(HttpStatus.NO_CONTENT).json({
        status: 'success',
        message: 'Cart updated successfully',
        data: deletedCart,
      });
    } catch (error) {
      throw new Error(`Failed to delete cart: ${error.message}`);
    }
  }
}
