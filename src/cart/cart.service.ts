import { Injectable } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectModel } from '@nestjs/mongoose';
import { CartEntity } from './entities/cart.entity';
import { Model } from 'mongoose';
import { CARTS_ACTIONS } from 'config/constants/constants';
@Injectable()
export class CartService {
  constructor(@InjectModel('Cart') private cartModel: Model<CartEntity>) {}
  async create({ customer, items }: CreateCartDto & { customer: string }) {
    try {
      const newCart = new this.cartModel({
        customer,
        items,
      });

      return await newCart.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Duplicate cart entry detected.');
      }
      throw new Error(`Failed to create cart: ${error.message}`);
    }
  }

  async findAll() {
    try {
      return await this.cartModel
        .find()
        .populate('customer')
        .populate('items.product');
    } catch (error) {
      throw new Error(`Failed to retrieve all carts: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      return await this.cartModel
        .findOne({ _id: id })
        .populate('customer')
        .populate('items.product');
    } catch (error) {
      throw new Error(`Failed to retrieve cart: ${error.message}`);
    }
  }

  async findOneCartOfCustomer(customerId: string) {
    try {
      return await this.cartModel
        .findOne({ customer: customerId })
        .populate('customer')
        .populate('items.product');
    } catch (error) {
      throw new Error(`Failed to retrieve cart: ${error.message}`);
    }
  }
  async update(cartId: string, updateCartDto: UpdateCartDto) {
    try {
      const { items } = updateCartDto;
      // If there are item updates
      if (items && items.length > 0) {
        for (const item of items) {
          const { product, quantity, priceAtAdd, action } = item;

          if (action === CARTS_ACTIONS.ADD) {
            await this.cartModel.findByIdAndUpdate(cartId, {
              $push: {
                items: {
                  product,
                  quantity,
                  priceAtAdd,
                  addedAt: new Date(),
                },
              },
            });
          }

          if (action === CARTS_ACTIONS.REMOVE) {
            await this.cartModel.findByIdAndUpdate(cartId, {
              $pull: { items: { product } },
            });
          }

          if (action === CARTS_ACTIONS.UPDATE) {
            // Use positional operator to update the quantity
            const updateFields: any = {};
            if (quantity !== undefined)
              updateFields['items.$.quantity'] = quantity;
            if (priceAtAdd !== undefined)
              updateFields['items.$.priceAtAdd'] = priceAtAdd;

            await this.cartModel.findOneAndUpdate(
              { _id: cartId, 'items.product': product },
              { $set: updateFields },
            );
          }
        }
      }

      // Finally, return the updated cart
      return this.cartModel.findById(cartId).populate('items.product customer');
    } catch (error) {
      throw new Error(`Failed to update cart: ${error.message}`);
    }
  }

  async remove(cartId: string) {
    try {
      return await this.cartModel.findByIdAndDelete(cartId);
    } catch (error) {
      throw new Error(`Failed to delete cart: ${error.message}`);
    }
  }
}
