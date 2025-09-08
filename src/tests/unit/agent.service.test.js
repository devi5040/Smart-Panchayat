const { addAgent, removeAgent, changeToAgent } = require('../../services/agent.services');
const { Users } = require('../../models');
const { ConflictError, NotFoundError, NoContentError } = require('../../utils/error');

// Mock Users model functions
jest.mock('../../models', () => ({
  Users: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
  },
}));

describe('Agent Services', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --------------------- addAgent ---------------------
  describe('addAgent', () => {
    it('should throw ConflictError if user already exists', async () => {
      Users.findOne.mockResolvedValue({ id: 1, phone_number: '12345' });

      await expect(addAgent('12345', 'John', 10.1, 20.2, 'en')).rejects.toThrow(ConflictError);

      expect(Users.findOne).toHaveBeenCalledWith({ where: { phone_number: '12345' } });
      expect(Users.create).not.toHaveBeenCalled();
    });

    it('should throw Error if user creation fails', async () => {
      Users.findOne.mockResolvedValue(null);
      Users.create.mockResolvedValue(null);

      await expect(addAgent('12345', 'John', 10.1, 20.2, 'en')).rejects.toThrow('User not created');
    });

    it('should propagate DB errors during create', async () => {
      Users.findOne.mockResolvedValue(null);
      Users.create.mockRejectedValue(new Error('DB failure'));

      await expect(addAgent('12345', 'John', 10.1, 20.2, 'en')).rejects.toThrow('DB failure');
    });

    it('should return created user on success', async () => {
      const mockUser = { id: 2, phone_number: '12345', user_name: 'John', user_role: 'agent' };
      Users.findOne.mockResolvedValue(null);
      Users.create.mockResolvedValue(mockUser);

      const result = await addAgent('12345', 'John', 10.1, 20.2, 'en');

      expect(result).toEqual(mockUser);
      expect(Users.create).toHaveBeenCalledWith({
        phone_number: '12345',
        user_name: 'John',
        latitude: 10.1,
        longitude: 20.2,
        language_preference: 'en',
        user_role: 'agent',
      });
    });
  });

  // --------------------- removeAgent ---------------------
  describe('removeAgent', () => {
    it('should throw NotFoundError if user not found', async () => {
      Users.findByPk.mockResolvedValue(null);

      await expect(removeAgent(1)).rejects.toThrow(NotFoundError);

      expect(Users.findByPk).toHaveBeenCalledWith(1);
    });

    it('should throw Error if user is not an agent', async () => {
      Users.findByPk.mockResolvedValue({ id: 1, user_role: 'customer' });

      await expect(removeAgent(1)).rejects.toThrow('Given user is not an agent!');
    });

    it('should throw NotFoundError if destroy returns 0', async () => {
      Users.findByPk.mockResolvedValue({ id: 1, user_role: 'agent' });
      Users.destroy.mockResolvedValue(0);

      await expect(removeAgent(1)).rejects.toThrow(NotFoundError);
    });

    it('should propagate DB errors during destroy', async () => {
      Users.findByPk.mockResolvedValue({ id: 1, user_role: 'agent' });
      Users.destroy.mockRejectedValue(new Error('DB failure'));

      await expect(removeAgent(1)).rejects.toThrow('DB failure');
    });

    it('should return true when agent is deleted successfully', async () => {
      Users.findByPk.mockResolvedValue({ id: 1, user_role: 'agent' });
      Users.destroy.mockResolvedValue(1);

      const result = await removeAgent(1);

      expect(result).toBe(true);
      expect(Users.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });

  // --------------------- changeToAgent ---------------------
  describe('changeToAgent', () => {
    it('should throw NotFoundError if user not found', async () => {
      Users.findByPk.mockResolvedValue(null);

      await expect(changeToAgent(1)).rejects.toThrow(NotFoundError);
    });

    it('should throw NoContentError if update returns 0', async () => {
      Users.findByPk.mockResolvedValue({ id: 1, user_role: 'customer' });
      Users.update.mockResolvedValue([0]);

      await expect(changeToAgent(1)).rejects.toThrow(NoContentError);
    });

    it('should propagate DB errors during update', async () => {
      Users.findByPk.mockResolvedValue({ id: 1, user_role: 'customer' });
      Users.update.mockRejectedValue(new Error('DB failure'));

      await expect(changeToAgent(1)).rejects.toThrow('DB failure');
    });

    it('should return updated user when successful', async () => {
      const updatedUser = {
        id: 1,
        user_name: 'John',
        phone_number: '12345',
        user_role: 'agent',
        language_preference: 'en',
      };

      Users.findByPk
        .mockResolvedValueOnce({ id: 1, user_role: 'customer' }) // first find
        .mockResolvedValueOnce(updatedUser); // second find with attributes
      Users.update.mockResolvedValue([1]);

      const result = await changeToAgent(1);

      expect(result).toEqual(updatedUser);
      expect(Users.update).toHaveBeenCalledWith({ user_role: 'agent' }, { where: { id: 1 } });
      expect(Users.findByPk).toHaveBeenLastCalledWith(1, {
        attributes: ['id', 'user_name', 'phone_number', 'user_role', 'language_preference'],
      });
    });
  });
});
