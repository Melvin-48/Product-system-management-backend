import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument, OrderStatus } from './schemas/order.schema';
import { Cart, CartDocument } from '../carts/schemas/cart.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async checkout(userId: string): Promise<Order> {
    const cart = await this.cartModel.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let totalAmount = 0;
    const orderItems = cart.items.map((item: any) => {
      const price = item.product.price;
      totalAmount += price * item.quantity;
      return {
        product: item.product._id,
        quantity: item.quantity,
        price, // snapshot taken right now, at checkout
      };
    });

    const order = new this.orderModel({
      user: userId,
      items: orderItems,
      totalAmount,
      status: OrderStatus.PENDING,
    });
    await order.save();

    cart.items = [] as any;
    await cart.save();

    return order;
  }

  async findAllForUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ user: userId }).populate('items.product').exec();
  }

  async findOne(userId: string, id: string): Promise<Order> {
    const order = await this.orderModel.findOne({ _id: id, user: userId }).populate('items.product');
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}