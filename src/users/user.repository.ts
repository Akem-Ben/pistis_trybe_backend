import { User } from "./users.models";

type FindOptions = {
  where?: Record<string, any>;
  attributes?: string[];
  raw?: boolean;
};

const applyQueryOptions = (
  query: any,
  options?: FindOptions,
) => {
  if (options?.attributes?.length) {
    query.select(options.attributes.join(" "));
  }

  if (options?.raw) {
    query.lean();
  }

  return query;
};

const userRepository = {
  findOne: async (options: FindOptions) => {
    const query = User.findOne(options.where ?? {});
    return applyQueryOptions(query, options);
  },

  findById: async (
    options:
      | string
      | (FindOptions & { where: { id: string } }),
  ) => {
    if (typeof options === "string") {
      return User.findById(options);
    }

    const id = options.where?.id;
    if (!id) {
      throw new Error("findById requires an id");
    }

    const query = User.findById(id);
    return applyQueryOptions(query, options);
  },

  findMany: async (options: FindOptions) => {
    const query = User.find(options.where ?? {});
    return applyQueryOptions(query, options);
  },
  
  createUser: async (data: {
    email: string;
    password?: string;
    googleId?: string;
    fullName?: string;
  }) => {
    return User.create({
      email: data.email,
      password: data.password ?? null,
      googleId: data.googleId ?? null,
      fullName: data.fullName ?? null,
    });
  },
};

export default userRepository;
