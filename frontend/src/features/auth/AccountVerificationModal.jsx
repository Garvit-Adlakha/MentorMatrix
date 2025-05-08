import { motion } from 'motion/react';
import { IconCircleCheck, IconX } from '../../components/ui/Icons';

const AccountVerificationModal = ({ onDismiss }) => {
  return (
    <div className="fixed inset-0 shadow-2xl backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-black/80 backdrop-blur-sm rounded-xl shadow-lg border border-border/50 p-8 max-w-md w-full relative"
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close modal"
        >
          <IconX size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <IconCircleCheck size={32} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Account Created Successfully!</h2>
          <p className="text-muted-foreground">
            Your mentor account has been created and is pending verification. We will review your application and notify you once it's approved.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4">
            <h3 className="font-medium text-foreground mb-2">What happens next?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Our admin team will review your application</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>You'll receive an email once your account is verified</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>You can then log in and start mentoring students</span>
              </li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={onDismiss}
            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors"
          >
            Got it, thanks!
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountVerificationModal;