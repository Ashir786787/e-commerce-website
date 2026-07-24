export type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  image: string;
};

export const categories: CategoryItem[] = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4q6tvpPScnvj49HfuU-ohqGo03xXBjyPs7wsMY69zsg&s=10",
  },
  {
    id: 2,
    name: "Fashion",
    slug: "fashion",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0S1ZlA_3_Msbp_TbWh0BUamk1QlVKpGTzqL2rj_PASg&s=10",
  },
  {
    id: 3,
    name: "Home & Living",
    slug: "home-living",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS501u8UyZL76oX2K7T7gWKZs-3Z2Jf8jU1QczNXqV9KA&s=10",
  },
  {
    id: 4,
    name: "Beauty",
    slug: "beauty",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgscpmHbucAAmKbOyoWA9vlpRWQwD2abue8oWve8IeHg&s=10",
  },
  {
    id: 5,
    name: "Sports",
    slug: "sports",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk-dUb4OQLiV3U1QuK8WXov1_CT-n_2Y7qXDm6CWrACA&s=10",
  },
  {
    id: 6,
    name: "Accessories",
    slug: "accessories",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvWESZlHvK1Yd8HkpnvA-Y6cNLbFZp42nM7YXBgegFZA&s=10",
  },
];
