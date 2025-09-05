const { Category } = require('../../models/');
const s3 = require('../../config/aws/aws.s3.config');
const {
  getCategories,
  getSignedUrl,
  addCategory,
  updateCategory,
  deleteCategory,
} = require('../../services/category.services');

jest.mock('../../models/', () => ({
  Category: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.mock('../../config/aws/aws.s3.config', () => ({
  getSignedUrlPromise: jest.fn(),
}));

process.env.AWS_BUCKET_NAME = 'test-bucket';
process.env.AWS_REGION = 'test-region';

describe('Category Services', () => {
  beforeAll(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1678886400000);
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe('getCategories', () => {
    it('should return an array of categories', async () => {
      Category.findAll.mockResolvedValue([
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ]);
      const categories = await getCategories();
      expect(categories).toEqual([
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ]);
    });

    it('should return an empty array if no categories are found', async () => {
      Category.findAll.mockResolvedValue([]);
      const categories = await getCategories();
      expect(categories).toEqual([]);
    });

    it('should throw an error if database interaction fails', async () => {
      Category.findAll.mockRejectedValue(new Error('Database error'));
      await expect(getCategories()).rejects.toThrow('Database error');
    });
  });

  describe('getSignedUrl', () => {
    it('should return a signed URL and file URL', async () => {
      const fileName = 'test.jpg';
      const fileType = 'image/jpeg';
      s3.getSignedUrlPromise.mockResolvedValue('test-signed-url');
      const result = await getSignedUrl(fileName, fileType);
      expect(result).toEqual({
        signedURL: 'test-signed-url',
        fileUrl:
          'https://test-bucket.s3.test-region.amazonaws.com/uploads/category/1678886400000-test.jpg',
      });
    });

    it('should throw an error if S3 interaction fails', async () => {
      s3.getSignedUrlPromise.mockRejectedValue(new Error('S3 error'));
      await expect(getSignedUrl('test.jpg', 'image/jpeg')).rejects.toThrow('S3 error');
    });
  });

  describe('addCategory', () => {
    it('should add a new category', async () => {
      await addCategory('Category 3', 'test-url');
      expect(Category.create).toHaveBeenCalledWith({
        name: 'Category 3',
        imageUrl: 'test-url',
      });
    });

    it('should throw an error if database interaction fails', async () => {
      Category.create.mockRejectedValue(new Error('Database error'));
      await expect(addCategory('Category 4', 'test-url')).rejects.toThrow('Database error');
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      Category.update.mockResolvedValue([1]);
      await updateCategory(1, 'Updated Category', 'updated-url');
      expect(Category.update).toHaveBeenCalledWith(
        { name: 'Updated Category', imageUrl: 'updated-url' },
        { where: { id: 1 } },
      );
    });

    it('should throw an error if categoryId is invalid', async () => {
      await expect(updateCategory(null, 'Updated Category', 'updated-url')).rejects.toThrow(
        'Category ID is not valid',
      );
      await expect(updateCategory(0, 'Updated Category', 'updated-url')).rejects.toThrow(
        'Category ID is not valid',
      );
      await expect(updateCategory('abc', 'Updated Category', 'updated-url')).rejects.toThrow(
        'Category ID is not valid',
      );
    });

    it('should throw an error if no rows were updated', async () => {
      Category.update.mockResolvedValue([0]);
      await expect(updateCategory(1, 'Updated Category', 'updated-url')).rejects.toThrow(
        'Category ID is not valid. No records updated.',
      );
    });

    it('should throw an error if database interaction fails', async () => {
      Category.update.mockRejectedValue(new Error('Database error'));
      await expect(updateCategory(1, 'Updated Category', 'updated-url')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      Category.destroy.mockResolvedValue(1);
      await deleteCategory(1);
      expect(Category.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw an error if categoryId is invalid', async () => {
      await expect(deleteCategory(null)).rejects.toThrow('Category ID is not valid');
      await expect(deleteCategory(0)).rejects.toThrow('Category ID is not valid');
      await expect(deleteCategory('abc')).rejects.toThrow('Category ID is not valid');
    });

    it('should throw an error if no rows were deleted', async () => {
      Category.destroy.mockResolvedValue(0);
      await expect(deleteCategory(1)).rejects.toThrow(
        'Category ID is invalid. No records deleted.',
      );
    });

    it('should throw an error if database interaction fails', async () => {
      Category.destroy.mockRejectedValue(new Error('Database error'));
      await expect(deleteCategory(1)).rejects.toThrow('Database error');
    });
  });
});
