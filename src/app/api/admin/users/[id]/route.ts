import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Wishlist from "@/models/Wishlist";
import { getCurrentUser } from "@/services/auth.service";

type UpdateUserBody = {
  role?: "user" | "admin";
  isVerified?: boolean;
};

interface AdminUserRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  { params }: AdminUserRouteProps
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access is required.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        {
          status: 400,
        }
      );
    }

    const user = await User.findById(id)
      .select(
        "fullName email role avatar isVerified createdAt updatedAt"
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Load admin user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load user.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: AdminUserRouteProps
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access is required.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        {
          status: 400,
        }
      );
    }

    const body = (await request.json()) as UpdateUserBody;

    if (
      body.role !== undefined &&
      body.role !== "user" &&
      body.role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid role.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      body.isVerified !== undefined &&
      typeof body.isVerified !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification value.",
        },
        {
          status: 400,
        }
      );
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const isEditingOwnAccount =
      targetUser._id.toString() === currentUser.id.toString();

    if (
      isEditingOwnAccount &&
      body.role &&
      body.role !== "admin"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You cannot remove your own admin role.",
        },
        {
          status: 400,
        }
      );
    }

    if (body.role !== undefined) {
      targetUser.role = body.role;
    }

    if (body.isVerified !== undefined) {
      targetUser.isVerified = body.isVerified;
    }

    await targetUser.save();

    return NextResponse.json({
      success: true,
      message: "User updated successfully.",
      data: {
        id: targetUser._id.toString(),
        fullName: targetUser.fullName,
        email: targetUser.email,
        role: targetUser.role,
        isVerified: targetUser.isVerified,
        updatedAt: targetUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update admin user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to update user.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: AdminUserRouteProps
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access is required.",
        },
        {
          status: 403,
        }
      );
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID.",
        },
        {
          status: 400,
        }
      );
    }

    const targetUser = await User.findById(id);

    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (targetUser._id.toString() === currentUser.id.toString()) {
      return NextResponse.json(
        {
          success: false,
          message: "You cannot delete your own account.",
        },
        {
          status: 400,
        }
      );
    }

    await Promise.all([
      User.findByIdAndDelete(id),
      Cart.deleteMany({ user: id }),
      Wishlist.deleteMany({ user: id }),
    ]);

    return NextResponse.json({
      success: true,
      message: "User deleted successfully.",
      data: {
        id,
      },
    });
  } catch (error) {
    console.error("Delete admin user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to delete user.",
      },
      {
        status: 500,
      }
    );
  }
}