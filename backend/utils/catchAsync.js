/* BlogAuth V1 utils/catchAsync.js — Express Async Handler Wrapper */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
